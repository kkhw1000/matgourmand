package com.matgourmand.common.response;


public record ApiResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "SUCCESS", "요청이 성공했습니다.", data);
    }
}
