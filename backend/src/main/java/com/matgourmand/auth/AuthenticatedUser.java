package com.matgourmand.auth;

import com.matgourmand.user.domain.UserRole;

public record AuthenticatedUser(
        Long id,
        UserRole role
) {
}
