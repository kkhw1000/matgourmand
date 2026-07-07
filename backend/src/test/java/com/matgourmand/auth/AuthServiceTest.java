package com.matgourmand.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.matgourmand.auth.dto.AuthResponse;
import com.matgourmand.auth.dto.LoginRequest;
import com.matgourmand.auth.dto.SignUpRequest;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.UnauthorizedException;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.domain.UserRole;
import com.matgourmand.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordHasher passwordHasher;

    @Test
    void signUpCreatesUserAndReturnsAccessToken() {
        SignUpRequest request = new SignUpRequest(
                "owner@test.com",
                "password123",
                "Owner",
                "010-1111-2222",
                UserRole.OWNER
        );

        AuthResponse response = authService.signUp(request);

        User savedUser = userRepository.findByEmail("owner@test.com").orElseThrow();
        assertThat(savedUser.getRole()).isEqualTo(UserRole.OWNER);
        assertThat(savedUser.getPassword()).isNotEqualTo("password123");
        assertThat(passwordHasher.matches("password123", savedUser.getPassword())).isTrue();
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("owner@test.com");
    }

    @Test
    void signUpFailsWhenEmailAlreadyExists() {
        userRepository.save(User.createCustomer(
                "duplicate@test.com",
                passwordHasher.hash("password123"),
                "Customer",
                "010-2222-3333"
        ));

        SignUpRequest request = new SignUpRequest(
                "duplicate@test.com",
                "password123",
                "Another",
                "010-3333-4444",
                UserRole.CUSTOMER
        );

        assertThatThrownBy(() -> authService.signUp(request))
                .isInstanceOf(BadRequestException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    @Test
    void loginReturnsAccessTokenWhenCredentialsMatch() {
        userRepository.save(User.createCustomer(
                "login@test.com",
                passwordHasher.hash("password123"),
                "Customer",
                "010-4444-5555"
        ));

        AuthResponse response = authService.login(new LoginRequest("login@test.com", "password123"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("login@test.com");
        assertThat(response.user().role()).isEqualTo(UserRole.CUSTOMER);
    }

    @Test
    void loginFailsWhenPasswordDoesNotMatch() {
        userRepository.save(User.createCustomer(
                "wrong-password@test.com",
                passwordHasher.hash("password123"),
                "Customer",
                "010-5555-6666"
        ));

        assertThatThrownBy(() -> authService.login(new LoginRequest("wrong-password@test.com", "password999")))
                .isInstanceOf(UnauthorizedException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.LOGIN_FAILED);
    }
}
