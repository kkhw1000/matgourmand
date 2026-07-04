package com.matgourmand.businesshour.controller;

import com.matgourmand.businesshour.dto.BusinessHourResponse;
import com.matgourmand.businesshour.dto.BusinessHourUpsertRequest;
import com.matgourmand.businesshour.service.BusinessHourService;
import com.matgourmand.common.response.ApiResponse;
import jakarta.validation.Valid;
import java.time.DayOfWeek;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stores/{storeId}/business-hours")
@RequiredArgsConstructor
public class BusinessHourController {

    private final BusinessHourService businessHourService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BusinessHourResponse>>> getBusinessHours(@PathVariable Long storeId) {
        return ResponseEntity.ok(ApiResponse.ok(businessHourService.getBusinessHours(storeId)));
    }

    @PutMapping("/{dayOfWeek}")
    public ResponseEntity<ApiResponse<BusinessHourResponse>> upsertBusinessHour(
            @PathVariable Long storeId,
            @PathVariable DayOfWeek dayOfWeek,
            @Valid @RequestBody BusinessHourUpsertRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(businessHourService.upsertBusinessHour(storeId, dayOfWeek, request)));
    }
}
