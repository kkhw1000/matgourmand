package com.matgourmand.auth;

import com.matgourmand.common.exception.BusinessException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.UnauthorizedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthTokenService authTokenService;
    private final HandlerExceptionResolver handlerExceptionResolver;

    public AuthTokenFilter(AuthTokenService authTokenService, HandlerExceptionResolver handlerExceptionResolver) {
        this.authTokenService = authTokenService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
                    throw new UnauthorizedException(ErrorCode.INVALID_AUTH_TOKEN);
                }

                String accessToken = authorizationHeader.substring(BEARER_PREFIX.length());
                AuthenticatedUser authenticatedUser = authTokenService.parseAccessToken(accessToken);
                UsernamePasswordAuthenticationToken authenticationToken =
                        UsernamePasswordAuthenticationToken.authenticated(
                                authenticatedUser,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + authenticatedUser.role().name()))
                        );
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

            filterChain.doFilter(request, response);
        } catch (BusinessException exception) {
            handlerExceptionResolver.resolveException(request, response, null, exception);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
