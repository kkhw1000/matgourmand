package com.matgourmand.user.domain;

import com.matgourmand.common.entity.BaseTimeEntity;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private User(String email, String password, String name, String phone, UserRole role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
        this.role = role;
    }

    public static User createOwner(String email, String password, String name, String phone) {
        validateRequiredValues(email, password, name);
        return new User(email, password, name, phone, UserRole.OWNER);
    }

    public static User createCustomer(String email, String password, String name, String phone) {
        validateRequiredValues(email, password, name);
        return new User(email, password, name, phone, UserRole.CUSTOMER);
    }

    private static void validateRequiredValues(String email, String password, String name) {
        if (isBlank(email) || isBlank(password) || isBlank(name)) {
            throw new BadRequestException(ErrorCode.USER_REQUIRED);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
