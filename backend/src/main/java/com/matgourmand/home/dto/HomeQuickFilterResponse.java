package com.matgourmand.home.dto;

public record HomeQuickFilterResponse(
        String key,
        String label,
        boolean selected
) {
}
