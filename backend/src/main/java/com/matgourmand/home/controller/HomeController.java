package com.matgourmand.home.controller;

import com.matgourmand.common.response.ApiResponse;
import com.matgourmand.home.dto.HomeResponse;
import com.matgourmand.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
@Tag(name = "Home", description = "Home page APIs")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping
    @Operation(summary = "Get home page data", description = "Retrieve aggregated data required to render the home page")
    public ResponseEntity<ApiResponse<HomeResponse>> getHome(
            @RequestParam(defaultValue = "seoul") String city
    ) {
        return ResponseEntity.ok(ApiResponse.ok(homeService.getHome(city)));
    }
}
