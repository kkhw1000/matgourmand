package com.matgourmand.home.dto;

import java.util.List;

public record HomeResponse(
        HomeLocationResponse location,
        HomeSearchSectionResponse searchSection,
        List<HomeQuickFilterResponse> quickFilters,
        List<HomeCategoryResponse> categories,
        List<HomeRestaurantSummaryResponse> featuredRestaurants,
        List<HomeNearbyRestaurantResponse> nearbyRestaurants,
        List<HomeCuratedCollectionResponse> curatedCollections,
        List<HomeAvailableReservationResponse> availableReservations
) {
}
