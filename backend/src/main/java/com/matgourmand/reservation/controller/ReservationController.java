package com.matgourmand.reservation.controller;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.common.response.ApiResponse;
import com.matgourmand.reservation.dto.ReservationCreateRequest;
import com.matgourmand.reservation.dto.ReservationResponse;
import com.matgourmand.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reservation", description = "Reservation APIs")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/api/reservations")
    @Operation(summary = "Create reservation", description = "Create a reservation as the authenticated CUSTOMER")
    @SecurityRequirement(name = "bearerAuth")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                            name = "Reservation create",
                            value = """
                                    {
                                      "storeId": 1,
                                      "reservationTime": "2026-07-13T18:30:00",
                                      "partySize": 2,
                                      "requestNote": "창가 자리 가능하면 부탁드립니다."
                                    }
                                    """
                    )
            )
    )
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody ReservationCreateRequest request
    ) {
        ReservationResponse response = reservationService.createReservation(authenticatedUser, request);
        return ResponseEntity.created(URI.create("/api/reservations/" + response.id()))
                .body(ApiResponse.ok(response));
    }

    @GetMapping("/api/reservations/{reservationId}")
    @Operation(summary = "Get reservation", description = "Retrieve a reservation visible to the reservation customer or store owner")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservation(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long reservationId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reservationService.getReservation(authenticatedUser, reservationId)));
    }

    @GetMapping("/api/stores/{storeId}/reservations")
    @Operation(summary = "Get store reservations", description = "Retrieve reservations for a store owned by the authenticated OWNER")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getStoreReservations(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long storeId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                reservationService.getStoreReservations(authenticatedUser, storeId)
        ));
    }

    @PutMapping("/api/reservations/{reservationId}/cancel")
    @Operation(summary = "Cancel reservation", description = "Cancel a reservation as the authenticated CUSTOMER")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable Long reservationId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                reservationService.cancelReservation(authenticatedUser, reservationId)
        ));
    }
}
