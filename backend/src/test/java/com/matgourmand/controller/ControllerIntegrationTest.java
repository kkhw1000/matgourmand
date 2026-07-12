package com.matgourmand.controller;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.matgourmand.auth.AuthTokenService;
import com.matgourmand.auth.PasswordHasher;
import com.matgourmand.businesshour.domain.BusinessHour;
import com.matgourmand.businesshour.repository.BusinessHourRepository;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@Transactional
class ControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private AuthTokenService authTokenService;

    @Autowired
    private PasswordHasher passwordHasher;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private BusinessHourRepository businessHourRepository;

    @Autowired
    private FilterChainProxy springSecurityFilterChain;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(springSecurityFilterChain)
                .build();
    }

    @Test
    void protectedApiReturnsUnauthorizedWhenAuthorizationHeaderIsMissing() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REQUIRED"));
    }

    @Test
    void protectedApiReturnsUnauthorizedWhenTokenIsInvalid() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header(AUTHORIZATION, "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_AUTH_TOKEN"));
    }

    @Test
    void signUpCreatesUserAndReturnsAccessToken() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "signup@test.com",
                                  "password": "password123",
                                  "name": "Signup User",
                                  "phone": "010-1111-2222",
                                  "role": "CUSTOMER"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("signup@test.com"))
                .andExpect(jsonPath("$.data.user.role").value("CUSTOMER"));
    }

    @Test
    void loginReturnsAccessTokenWhenCredentialsAreValid() throws Exception {
        userRepository.save(User.createCustomer(
                "login@test.com",
                passwordHasher.hash("password123"),
                "Login User",
                "010-2222-3333"
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "login@test.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("login@test.com"));
    }

    @Test
    void usersMeReturnsCurrentUserWhenTokenIsValid() throws Exception {
        User customer = userRepository.save(User.createCustomer("me@test.com", "encoded-password", "Current User", "010-3333-4444"));

        mockMvc.perform(get("/api/users/me")
                        .header(AUTHORIZATION, bearerToken(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("me@test.com"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
    }

    @Test
    void ownerCanCreateStoreWithValidToken() throws Exception {
        User owner = userRepository.save(User.createOwner("owner@test.com", "encoded-password", "Owner", null));

        mockMvc.perform(post("/api/stores")
                        .header(AUTHORIZATION, bearerToken(owner))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "MatGourmand",
                                  "address": "Seoul",
                                  "phone": "02-111-2222",
                                  "description": "French dining"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ownerId").value(owner.getId()))
                .andExpect(jsonPath("$.data.name").value("MatGourmand"));
    }

    @Test
    void customerCannotCreateStoreEvenWithValidToken() throws Exception {
        User customer = userRepository.save(User.createCustomer("customer@test.com", "encoded-password", "Customer", null));

        mockMvc.perform(post("/api/stores")
                        .header(AUTHORIZATION, bearerToken(customer))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "MatGourmand",
                                  "address": "Seoul"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("OWNER_ROLE_REQUIRED"));
    }

    @Test
    void customerCanCreateReservationWithValidToken() throws Exception {
        User owner = userRepository.save(User.createOwner("owner2@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("customer2@test.com", "encoded-password", "Customer", null));
        Store store = storeRepository.save(Store.create(owner, "MatGourmand", "Seoul", null, null));
        businessHourRepository.save(BusinessHour.create(
                store,
                DayOfWeek.MONDAY,
                LocalTime.of(9, 0),
                LocalTime.of(21, 0),
                false
        ));

        String reservationTime = LocalDate.now()
                .with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY))
                .atTime(18, 0)
                .toString();

        mockMvc.perform(post("/api/reservations")
                        .header(AUTHORIZATION, bearerToken(customer))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "storeId": %d,
                                  "reservationTime": "%s",
                                  "partySize": 2,
                                  "requestNote": "window seat"
                                }
                                """.formatted(store.getId(), reservationTime)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.storeId").value(store.getId()))
                .andExpect(jsonPath("$.data.customerId").value(customer.getId()))
                .andExpect(jsonPath("$.data.partySize").value(2));
    }

    private String bearerToken(User user) {
        return "Bearer " + authTokenService.createAccessToken(user.getId(), user.getRole());
    }
}
