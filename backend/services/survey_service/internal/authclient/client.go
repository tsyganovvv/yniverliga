package authclient

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

var ErrUnauthorized = errors.New("unauthorized")

type UserProfile struct {
	ID           string  `json:"id"`
	Username     string  `json:"username"`
	Role         string  `json:"role"`
	DepartmentID *string `json:"department_id"`
	IsActive     bool    `json:"is_active"`
}

type UserRecord struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	IsActive bool   `json:"is_active"`
}

type Client struct {
	baseURL string
	http    *http.Client
}

func New(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: 5 * time.Second},
	}
}

func (c *Client) ValidateSession(ctx context.Context, bearer string) (*UserProfile, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/v1/sessions/", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", bearer)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("auth service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusBadRequest {
		return nil, ErrUnauthorized
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("auth service status: %d", resp.StatusCode)
	}

	var profile UserProfile
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, fmt.Errorf("decode auth profile: %w", err)
	}
	if profile.ID == "" {
		return nil, errors.New("auth profile missing id")
	}

	return &profile, nil
}

func (c *Client) ListUsers(ctx context.Context, bearer string) ([]UserRecord, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/v1/users/?limit=1000", nil)
	if err != nil {
		return nil, err
	}
	if bearer != "" {
		req.Header.Set("Authorization", bearer)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("auth users fetch failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return nil, ErrUnauthorized
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("auth users status: %d", resp.StatusCode)
	}

	var users []UserRecord
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("decode auth users: %w", err)
	}
	return users, nil
}
