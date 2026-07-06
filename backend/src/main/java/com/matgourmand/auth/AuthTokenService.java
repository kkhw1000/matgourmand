package com.matgourmand.auth;

import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.UnauthorizedException;
import com.matgourmand.user.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AuthTokenService {

    private static final String ROLE_CLAIM = "role";

    private final SecretKey secretKey;
    private final long expirationMillis;
    private final String issuer;

    public AuthTokenService(
            @Value("${app.auth.token-secret-base64}") String secret,
            @Value("${app.auth.access-token-expiration-millis}") long expirationMillis,
            @Value("${app.auth.issuer}") String issuer
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMillis = expirationMillis;
        this.issuer = issuer;
    }

    public String createAccessToken(Long userId, UserRole role) {
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + expirationMillis);

        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim(ROLE_CLAIM, role.name())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public AuthenticatedUser parseAccessToken(String accessToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(accessToken)
                    .getPayload();

            if (!issuer.equals(claims.getIssuer())) {
                throw new UnauthorizedException(ErrorCode.INVALID_AUTH_TOKEN);
            }

            Long userId = Long.parseLong(claims.getSubject());
            String roleValue = claims.get(ROLE_CLAIM, String.class);
            UserRole role = UserRole.valueOf(roleValue);

            return new AuthenticatedUser(userId, role);
        } catch (ExpiredJwtException exception) {
            throw new UnauthorizedException(ErrorCode.AUTH_TOKEN_EXPIRED);
        } catch (UnauthorizedException exception) {
            throw exception;
        } catch (JwtException | IllegalArgumentException exception) {
            throw new UnauthorizedException(ErrorCode.INVALID_AUTH_TOKEN);
        }
    }
}
