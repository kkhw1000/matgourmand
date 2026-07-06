package com.matgourmand.auth;

import com.matgourmand.auth.dto.AuthResponse;
import com.matgourmand.auth.dto.LoginRequest;
import com.matgourmand.auth.dto.SignUpRequest;
import com.matgourmand.common.response.ApiResponse;
import com.matgourmand.user.dto.UserResponse;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signUp(@Valid @RequestBody SignUpRequest request) {
        AuthResponse response = authService.signUp(request);
        return ResponseEntity.created(URI.create("/api/users/me"))
                .body(ApiResponse.ok(response));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @CurrentUser AuthenticatedUser authenticatedUser
    ) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(authenticatedUser.id())));
    }
}
