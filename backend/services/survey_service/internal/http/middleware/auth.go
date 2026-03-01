package middleware

import (
	"context"
	"net/http"
	"strings"

	"survey_service/internal/authclient"
)

type contextKey string

const userKey contextKey = "current_user"

func Auth(ac *authclient.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authz := r.Header.Get("Authorization")
			if !strings.HasPrefix(strings.ToLower(authz), "bearer ") {
				http.Error(w, "missing bearer token", http.StatusUnauthorized)
				return
			}

			user, err := ac.ValidateSession(r.Context(), authz)
			if err != nil || !user.IsActive {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), userKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func CurrentUser(ctx context.Context) (*authclient.UserProfile, bool) {
	v := ctx.Value(userKey)
	user, ok := v.(*authclient.UserProfile)
	return user, ok
}

func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := CurrentUser(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		if user.Role != "ADMIN" && user.Role != "ROOT" {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
