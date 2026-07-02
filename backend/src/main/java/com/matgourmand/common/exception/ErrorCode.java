package com.matgourmand.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "잘못된 요청입니다."),
    USER_REQUIRED(HttpStatus.BAD_REQUEST, "USER_REQUIRED", "사용자 필수 값이 누락되었습니다."),
    STORE_OWNER_REQUIRED(HttpStatus.BAD_REQUEST, "STORE_OWNER_REQUIRED", "매장 owner는 필수입니다."),
    STORE_NAME_ADDRESS_REQUIRED(HttpStatus.BAD_REQUEST, "STORE_NAME_ADDRESS_REQUIRED", "매장 이름과 주소는 필수입니다."),
    STORE_STATUS_REQUIRED(HttpStatus.BAD_REQUEST, "STORE_STATUS_REQUIRED", "매장 상태는 필수입니다."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, "OWNER_NOT_FOUND", "사장 사용자를 찾을 수 없습니다."),
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "STORE_NOT_FOUND", "매장을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
