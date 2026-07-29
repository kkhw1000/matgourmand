package com.matgourmand.home.dto;

public record HomeNearbyRestaurantResponse(
        String id,
        String name,
        String area,
        String summary,
        String availableSlotLabel
) {
}
