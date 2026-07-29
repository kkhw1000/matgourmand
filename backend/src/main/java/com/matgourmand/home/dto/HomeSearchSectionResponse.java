package com.matgourmand.home.dto;

public record HomeSearchSectionResponse(
        String title,
        String subtitle,
        String keywordPlaceholder,
        String defaultMoodLabel,
        String defaultAreaLabel
) {
}
