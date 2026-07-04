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
    BUSINESS_HOUR_DAY_REQUIRED(HttpStatus.BAD_REQUEST, "BUSINESS_HOUR_DAY_REQUIRED", "운영 요일은 필수입니다."),
    BUSINESS_HOUR_TIME_REQUIRED(HttpStatus.BAD_REQUEST, "BUSINESS_HOUR_TIME_REQUIRED", "영업일에는 오픈 시간과 마감 시간이 모두 필요합니다."),
    BUSINESS_HOUR_TIME_RANGE_INVALID(HttpStatus.BAD_REQUEST, "BUSINESS_HOUR_TIME_RANGE_INVALID", "오픈 시간은 마감 시간보다 빨라야 합니다."),
    RESERVATION_TIME_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "RESERVATION_TIME_NOT_AVAILABLE", "예약 가능한 운영시간이 아닙니다."),
    RESERVATION_PARTY_SIZE_INVALID(HttpStatus.BAD_REQUEST, "RESERVATION_PARTY_SIZE_INVALID", "예약 인원은 1명 이상이어야 합니다."),
    RESERVATION_ALREADY_CANCELED(HttpStatus.BAD_REQUEST, "RESERVATION_ALREADY_CANCELED", "이미 취소된 예약입니다."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, "OWNER_NOT_FOUND", "사장 사용자를 찾을 수 없습니다."),
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "STORE_NOT_FOUND", "매장을 찾을 수 없습니다."),
    CUSTOMER_NOT_FOUND(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "고객 사용자를 찾을 수 없습니다."),
    RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "RESERVATION_NOT_FOUND", "예약을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
