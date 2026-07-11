package com.matgourmand.businesshour.controller;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.auth.CurrentUser;
import com.matgourmand.businesshour.dto.BusinessHourResponse;
import com.matgourmand.businesshour.dto.BusinessHourUpsertRequest;
import com.matgourmand.businesshour.service.BusinessHourService;
import com.matgourmand.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Business Hour", description = "Store business-hour APIs")
public class BusinessHourController {

    private final BusinessHourService businessHourService;

    @GetMapping
    @Operation(summary = "Get business hours", description = "Retrieve business hours for a store")
    public ResponseEntity<ApiResponse<List<BusinessHourResponse>>> getBusinessHours(@PathVariable Long storeId) {
        return ResponseEntity.ok(ApiResponse.ok(businessHourService.getBusinessHours(storeId)));
    }

    @PutMapping("/{dayOfWeek}")
    @Operation(summary = "Upsert business hour", description = "Create or update business hours for the authenticated OWNER's store")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BusinessHourResponse>> upsertBusinessHour(
            @CurrentUser AuthenticatedUser authenticatedUser,
            @PathVariable Long storeId,
            @PathVariable DayOfWeek dayOfWeek,
            @Valid @RequestBody BusinessHourUpsertRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                businessHourService.upsertBusinessHour(authenticatedUser, storeId, dayOfWeek, request)
        ));
    }
}
