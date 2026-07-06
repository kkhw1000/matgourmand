package com.matgourmand.auth;

import com.matgourmand.auth.dto.AuthResponse;
import com.matgourmand.auth.dto.LoginRequest;
import com.matgourmand.auth.dto.SignUpRequest;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ResourceNotFoundException;
import com.matgourmand.common.exception.UnauthorizedException;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.domain.UserRole;
import com.matgourmand.user.dto.UserResponse;
import com.matgourmand.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final AuthTokenService authTokenService;

    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        String encodedPassword = passwordHasher.hash(request.password());
        User savedUser = userRepository.save(createUser(request, encodedPassword));
        String accessToken = authTokenService.createAccessToken(savedUser.getId(), savedUser.getRole());
        return AuthResponse.of(accessToken, UserResponse.from(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.LOGIN_FAILED));

        if (!passwordHasher.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException(ErrorCode.LOGIN_FAILED);
        }

        String accessToken = authTokenService.createAccessToken(user.getId(), user.getRole());
        return AuthResponse.of(accessToken, UserResponse.from(user));
    }

    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    private User createUser(SignUpRequest request, String encodedPassword) {
        if (request.role() == UserRole.OWNER) {
            return User.createOwner(request.email(), encodedPassword, request.name(), request.phone());
        }
        return User.createCustomer(request.email(), encodedPassword, request.name(), request.phone());
    }
}
