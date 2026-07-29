package com.matgourmand.home.dto;

import java.util.List;

public record HomeCuratedCollectionResponse(
        String key,
        String title,
        String description,
        List<HomeCollectionRestaurantResponse> restaurants
) {
}
