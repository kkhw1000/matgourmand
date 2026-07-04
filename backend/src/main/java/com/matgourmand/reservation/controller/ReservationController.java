package com.matgourmand.reservation.controller;

import com.matgourmand.common.response.ApiResponse;
import com.matgourmand.reservation.dto.ReservationCreateRequest;
import com.matgourmand.reservation.dto.ReservationResponse;
import com.matgourmand.reservation.service.ReservationService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/api/reservations")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody ReservationCreateRequest request
    ) {
        ReservationResponse response = reservationService.createReservation(request);
        return ResponseEntity.created(URI.create("/api/reservations/" + response.id()))
                .body(ApiResponse.ok(response));
    }

    @GetMapping("/api/reservations/{reservationId}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.ok(reservationService.getReservation(reservationId)));
    }

    @GetMapping("/api/stores/{storeId}/reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getStoreReservations(@PathVariable Long storeId) {
        return ResponseEntity.ok(ApiResponse.ok(reservationService.getStoreReservations(storeId)));
    }

    @PutMapping("/api/reservations/{reservationId}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.ok(reservationService.cancelReservation(reservationId)));
    }
}
