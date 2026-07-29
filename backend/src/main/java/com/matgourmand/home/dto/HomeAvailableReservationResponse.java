package com.matgourmand.home.dto;

public record HomeAvailableReservationResponse(
        String restaurantId,
        String restaurantName,
        String time,
        String partySizeLabel
) {
}
