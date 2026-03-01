import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";
import styles from "./EmployeePage.module.css";
import FeedbackForm from "../../components/FeedbackForm/FeedbackForm";

const teams = [
  "Отдел разработки",
  "Отдел маркетинга",
  "Отдел продаж",
  "Отдел поддержки",
  "HR отдел"
];

const employees = [
  { name: "Анна Котенкова", team: "Отдел маркетинга" },
  { name: "Сергей Корсаков", team: "Отдел разработки" },
  { name: "Мария Иванова", team: "Отдел продаж" },
  { name: "Дмитрий Петров", team: "Отдел разработки" },
  { name: "Елена Смирнова", team: "HR отдел" },
  { name: "Алексей Новиков", team: "Отдел поддержки" }
];

const EmployeePage = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isManager = userRole === 'manager';
  
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const filteredEmployees = selectedTeam 
    ? employees.filter(emp => emp.team === selectedTeam)
    : employees;

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    setShowTeamDropdown(false);
  };

  const handleEmployeeSelect = (employee: string) => {
    setSelectedEmployee(employee);
    setShowEmployeeDropdown(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Команда филиала</h1>

        <div className={styles.buttons}>
          <div className={styles.dropdownWrapper}>
            <button 
              className={styles.outline}
              onClick={() => setShowTeamDropdown(!showTeamDropdown)}
            >
              {selectedTeam || "Выбрать команду"}
              <ChevronDown className={styles.chevron} />
            </button>
            {showTeamDropdown && (
              <div className={styles.dropdown}>
                {teams.map((team) => (
                  <div 
                    key={team}
                    className={styles.dropdownItem}
                    onClick={() => handleTeamSelect(team)}
                  >
                    {team}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dropdownWrapper}>
            <button 
              className={styles.outline}
              onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
            >
              {selectedEmployee || "Выбрать сотрудника"}
              <ChevronDown className={styles.chevron} />
            </button>
            {showEmployeeDropdown && (
              <div className={styles.dropdown}>
                {filteredEmployees.map((emp) => (
                  <div 
                    key={emp.name}
                    className={styles.dropdownItem}
                    onClick={() => handleEmployeeSelect(emp.name)}
                  >
                    {emp.name}
                    <span className={styles.employeeTeam}>{emp.team}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isManager && (
            <button className={styles.outline} onClick={() => navigate('/dashboard')}>К статистике</button>
          )}
          {!isManager && (
            <div className={styles.userActions}>
              <button 
                className={styles.iconButton} 
                onClick={() => navigate('/notifications')}
                title="Уведомления"
              >
                <Bell className={styles.icon} />
              </button>
              <button 
                className={styles.profileButton} 
                onClick={() => navigate('/profile')}
                title="Профиль"
              >
                <img 
                  src="https://picsum.photos/seed/profile/100/100" 
                  alt="Profile" 
                  className={styles.profileImage}
                />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <FeedbackForm selectedEmployee={selectedEmployee} />
      </div>
    </div>
  );
};

export default EmployeePage;
