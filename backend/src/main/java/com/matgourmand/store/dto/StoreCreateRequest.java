package com.matgourmand.store.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record StoreCreateRequest(
        @Schema(example = "MatGourmand Bistro")
        @NotBlank(message = "매장 이름은 필수입니다.")
        String name,
        @Schema(example = "서울 성수동 123-45")
        @NotBlank(message = "주소는 필수입니다.")
        String address,
        @Schema(example = "02-123-4567")
        String phone,
        @Schema(example = "프렌치 코스와 내추럴 와인을 중심으로 운영하는 예약제 비스트로")
        String description
) {
}
