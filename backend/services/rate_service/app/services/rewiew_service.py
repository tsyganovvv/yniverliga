import csv
from uuid import UUID
from html import escape
from io import BytesIO, StringIO
from zipfile import ZIP_DEFLATED, ZipFile

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.rewiew_repository import RewiewRepository
from app.domain.schemas.rewiew_schemas import RewiewSchema
from app.domain.models.rewiew_models import Rewiew


class RewiewService:
    def __init__(self, db: AsyncSession):
        self.repository = RewiewRepository(db)

    @staticmethod
    def _as_value_error(error: Exception) -> ValueError:
        return ValueError(str(error))

    @staticmethod
    def _report_headers() -> list[str]:
        return [
            "ID отзыва",
            "Дата отзыва (UTC)",
            "ID автора",
            "Username автора",
            "ФИО автора",
            "ID получателя",
            "Username получателя",
            "ФИО получателя",
            "Контекст отзыва",
            "Тема",
            "Категория",
            "Тип отзыва",
            "Оценка (1-5)",
        ]

    @staticmethod
    def _col_name(index: int) -> str:
        name = ""
        while index > 0:
            index, rem = divmod(index - 1, 26)
            name = chr(65 + rem) + name
        return name

    @classmethod
    def _build_xlsx(cls, headers: list[str], rows: list[dict]) -> bytes:
        def xml_text(value: str) -> str:
            return escape(value, quote=False)

        all_rows: list[list[str]] = [headers]
        for row in rows:
            all_rows.append([str(row.get(key, "")) for key in headers])

        sheet_rows = []
        for row_idx, values in enumerate(all_rows, start=1):
            cells = []
            for col_idx, value in enumerate(values, start=1):
                cell_ref = f"{cls._col_name(col_idx)}{row_idx}"
                cells.append(
                    f'<c r="{cell_ref}" t="inlineStr"><is><t>{xml_text(value)}</t></is></c>'
                )
            sheet_rows.append(f'<row r="{row_idx}">{"".join(cells)}</row>')
        sheet_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            f'<sheetData>{"".join(sheet_rows)}</sheetData>'
            "</worksheet>"
        )

        content_types_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            "</Types>"
        )

        rels_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
            'Target="xl/workbook.xml"/>'
            "</Relationships>"
        )

        workbook_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets>'
            "</workbook>"
        )

        workbook_rels_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            'Target="worksheets/sheet1.xml"/>'
            "</Relationships>"
        )

        buff = BytesIO()
        with ZipFile(buff, mode="w", compression=ZIP_DEFLATED) as zf:
            zf.writestr("[Content_Types].xml", content_types_xml)
            zf.writestr("_rels/.rels", rels_xml)
            zf.writestr("xl/workbook.xml", workbook_xml)
            zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
            zf.writestr("xl/worksheets/sheet1.xml", sheet_xml)
        return buff.getvalue()

    async def _collect_report_rows(self, department_id: UUID | None = None) -> list[dict]:
        raw_rows = await self.repository.get_report_rows(department_id=department_id)
        rows = []
        for item in raw_rows:
            rows.append(
                {
                    "ID отзыва": item["review_id"],
                    "Дата отзыва (UTC)": item["created_at"],
                    "ID автора": item["from_user_id"],
                    "Username автора": item["from_username"],
                    "ФИО автора": item["from_fullname"],
                    "ID получателя": item["to_user_id"],
                    "Username получателя": item["to_username"],
                    "ФИО получателя": item["to_fullname"],
                    "Контекст отзыва": item["context"],
                    "Тема": item["topic"],
                    "Категория": item["category"],
                    "Тип отзыва": item["feedback_type"],
                    "Оценка (1-5)": item["rate"],
                }
            )
        return rows

    async def export_report_csv(self) -> bytes:
        headers = self._report_headers()
        rows = await self._collect_report_rows()
        buff = StringIO()
        writer = csv.DictWriter(buff, fieldnames=headers, delimiter=";")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
        return buff.getvalue().encode("utf-8-sig")

    async def export_report_excel(self) -> bytes:
        headers = self._report_headers()
        rows = await self._collect_report_rows()
        return self._build_xlsx(headers=headers, rows=rows)
    
    async def create_rewiew(self, rewiew_data: RewiewSchema) -> Rewiew:
        from_user_exists = await self.repository.user_exists(rewiew_data.from_user_id)
        if not from_user_exists:
            raise ValueError("undefined user id in from_user_id")
        to_user_exists = await self.repository.user_exists(rewiew_data.to_user_id)
        if not to_user_exists:
            raise ValueError("undefined user id in to_user_id")
        try:
            result = await self.repository.create(rewiew_data)
        except IntegrityError as e:
            error_text = str(e).lower()
            if "rewiews_topic_fkey" in error_text or "topic" in error_text:
                raise ValueError("undefined topic") from e
            raise ValueError("undefined user id") from e
        except Exception as e:
            raise self._as_value_error(e)
        return result

    async def get_all_rewiews(self) -> list[Rewiew]:
        try:
            return await self.repository.get_all()
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_department(self, department_id: UUID) -> list[dict]:
        try:
            return await self.repository.get_report_rows(department_id=department_id)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_from_user_id(self, user_id: UUID) -> list[Rewiew]:
        try:
            return await self.repository.get_by_from_user_id(user_id)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_to_user_id(self, user_id: UUID) -> list[Rewiew]:
        try:
            return await self.repository.get_by_to_user_id(user_id)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_category(self, category: str) -> list[Rewiew]:
        try:
            return await self.repository.get_by_category(category)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_positive(self, is_positive: bool) -> list[Rewiew]:
        try:
            return await self.repository.get_by_positive(is_positive)
        except Exception as e:
            raise self._as_value_error(e)

    async def get_rewiews_by_rate(self, rate: int) -> list[Rewiew]:
        if rate < 1 or rate > 5:
            raise ValueError("rate must be between 1 and 5")
        try:
            return await self.repository.get_by_rate(rate)
        except Exception as e:
            raise self._as_value_error(e)
