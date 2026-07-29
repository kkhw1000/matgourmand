package com.matgourmand.home.service;

import com.matgourmand.home.dto.HomeAvailableReservationResponse;
import com.matgourmand.home.dto.HomeCategoryResponse;
import com.matgourmand.home.dto.HomeCollectionRestaurantResponse;
import com.matgourmand.home.dto.HomeCuratedCollectionResponse;
import com.matgourmand.home.dto.HomeLocationResponse;
import com.matgourmand.home.dto.HomeNearbyRestaurantResponse;
import com.matgourmand.home.dto.HomeQuickFilterResponse;
import com.matgourmand.home.dto.HomeResponse;
import com.matgourmand.home.dto.HomeRestaurantSummaryResponse;
import com.matgourmand.home.dto.HomeSearchSectionResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HomeService {

    public HomeResponse getHome(String cityCode) {
        return new HomeResponse(
                new HomeLocationResponse(cityCode, resolveCityName(cityCode)),
                new HomeSearchSectionResponse(
                        "검색하고, 바로 괜찮은 곳만 골라보세요.",
                        "분위기, 메뉴, 지역에 맞는 맛집을 빠르게 보고 예약까지 이어서 갈 수 있게 만든 메인 홈 화면입니다.",
                        "파스타, 브런치, 와인바",
                        "데이트",
                        "성수, 한남"
                ),
                List.of(
                        new HomeQuickFilterResponse("all", "전체", true),
                        new HomeQuickFilterResponse("date", "데이트", false),
                        new HomeQuickFilterResponse("brunch", "브런치", false),
                        new HomeQuickFilterResponse("korean", "한식", false),
                        new HomeQuickFilterResponse("winebar", "와인바", false),
                        new HomeQuickFilterResponse("solo", "혼밥", false)
                ),
                List.of(
                        new HomeCategoryResponse("pasta", "파스타", "🍝"),
                        new HomeCategoryResponse("brunch", "브런치", "🥐"),
                        new HomeCategoryResponse("steak", "스테이크", "🥩"),
                        new HomeCategoryResponse("wine", "와인바", "🍷"),
                        new HomeCategoryResponse("japanese", "일식", "🍣"),
                        new HomeCategoryResponse("cafe", "카페", "☕")
                ),
                List.of(
                        new HomeRestaurantSummaryResponse(
                                "french-dining",
                                "오늘의 추천",
                                "한남동 프렌치 다이닝",
                                "조용한 저녁 · 데이트 · 예약 가능",
                                "한남동",
                                "차분한 데이트",
                                "1인 45,000원대",
                                "오늘 19:30 가능",
                                null
                        ),
                        new HomeRestaurantSummaryResponse(
                                "brunch-bistro",
                                "지금 인기",
                                "성수 브런치 비스트로",
                                "밝은 분위기 · 친구 모임 · 주말 인기",
                                "성수동",
                                "가벼운 브런치",
                                "1인 22,000원대",
                                "오늘 14:00 가능",
                                null
                        )
                ),
                List.of(
                        new HomeNearbyRestaurantResponse(
                                "monte-brunch",
                                "몽트 브런치",
                                "성수동",
                                "브런치 · 도보 12분",
                                "오늘 14:00 가능"
                        ),
                        new HomeNearbyRestaurantResponse(
                                "oak-steak",
                                "오크 스테이크 하우스",
                                "한남동",
                                "스테이크 · 예약 많음",
                                "오늘 19:30 가능"
                        ),
                        new HomeNearbyRestaurantResponse(
                                "yuja-izakaya",
                                "유자 이자카야",
                                "연남동",
                                "일식 · 저녁 추천",
                                "오늘 20:00 가능"
                        )
                ),
                List.of(
                        new HomeCuratedCollectionResponse(
                                "date",
                                "데이트할 때",
                                "너무 시끄럽지 않고 분위기 좋은 곳 위주로 골랐어요.",
                                List.of(
                                        new HomeCollectionRestaurantResponse("french-dining", "한남동 프렌치 다이닝"),
                                        new HomeCollectionRestaurantResponse("wine-bar", "연남동 와인바"),
                                        new HomeCollectionRestaurantResponse("small-bistro", "서촌 작은 비스트로")
                                )
                        ),
                        new HomeCuratedCollectionResponse(
                                "friends",
                                "친구 만날 때",
                                "편하게 오래 앉아있기 좋고 메뉴 고르기 쉬운 곳이에요.",
                                List.of(
                                        new HomeCollectionRestaurantResponse("brunch-bistro", "성수 브런치 비스트로"),
                                        new HomeCollectionRestaurantResponse("taco-bar", "합정 타코 바"),
                                        new HomeCollectionRestaurantResponse("pub-dining", "을지로 펍 다이닝")
                                )
                        ),
                        new HomeCuratedCollectionResponse(
                                "solo",
                                "혼자 가볍게",
                                "부담 없이 들어가기 좋고 혼밥하기 편한 곳만 모았어요.",
                                List.of(
                                        new HomeCollectionRestaurantResponse("ramen", "망원 라멘집"),
                                        new HomeCollectionRestaurantResponse("sandwich", "용산 샌드위치 바"),
                                        new HomeCollectionRestaurantResponse("rice-bowl", "서교동 덮밥집")
                                )
                        )
                ),
                List.of(
                        new HomeAvailableReservationResponse("french-dining", "르블랑", "18:00", "2인 가능"),
                        new HomeAvailableReservationResponse("mono-kitchen", "모노 키친", "18:30", "4인 가능"),
                        new HomeAvailableReservationResponse("vinoteca", "비노테카", "20:00", "2인 가능")
                )
        );
    }

    private String resolveCityName(String cityCode) {
        if ("seoul".equalsIgnoreCase(cityCode)) {
            return "서울";
        }
        return cityCode;
    }
}
