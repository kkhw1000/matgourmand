package com.matgourmand.controller;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasItem;

import com.matgourmand.auth.AuthTokenService;
import com.matgourmand.auth.PasswordHasher;
import com.matgourmand.businesshour.domain.BusinessHour;
import com.matgourmand.businesshour.repository.BusinessHourRepository;
import com.matgourmand.reservation.domain.Reservation;
import com.matgourmand.reservation.repository.ReservationRepository;
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
    private ReservationRepository reservationRepository;

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
                .with(TemporalAdjusters.next(DayOfWeek.MONDAY))
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

    // 고객이 식당을 찾고 예약한 뒤 취소할 때까지의 API 흐름과 접근 권한을 검증한다.
    @Test
    void customerCanDiscoverBookAndCancelAStore() throws Exception {
        User owner = userRepository.save(User.createOwner("flow-owner@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("flow-customer@test.com", "encoded-password", "Customer", null));
        User anotherCustomer = userRepository.save(User.createCustomer("flow-other@test.com", "encoded-password", "Other", null));
        Store store = storeRepository.save(Store.create(owner, "성수 비스트로", "서울 성수동", null, "프렌치 다이닝",
                "성수", "프렌치", 40000, 2));
        businessHourRepository.save(BusinessHour.create(store, DayOfWeek.MONDAY,
                LocalTime.of(18, 0), LocalTime.of(19, 0), false));
        LocalDate date = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        String timesUrl = "/api/stores/" + store.getId() + "/available-times";

        // 비로그인 상태에서도 식당 목록·상세와 예약 가능한 시간대를 조회할 수 있어야 한다.
        mockMvc.perform(get("/api/stores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].name").value(hasItem("성수 비스트로")));
        mockMvc.perform(get("/api/stores/{storeId}", store.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.region").value("성수"))
                .andExpect(jsonPath("$.data.theme").value("프렌치"))
                .andExpect(jsonPath("$.data.averagePrice").value(40000))
                .andExpect(jsonPath("$.data.capacityPerSlot").value(2));
        mockMvc.perform(get(timesUrl).param("date", date.toString()).param("partySize", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(hasItem("18:00")));

        // 고객이 예약하면 예약 번호와 접수 상태가 반환되어야 한다.
        String location = mockMvc.perform(post("/api/reservations")
                        .header(AUTHORIZATION, bearerToken(customer))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"storeId":%d,"reservationTime":"%sT18:00:00","partySize":2}
                                """.formatted(store.getId(), date)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn().getResponse().getHeader("Location");
        long reservationId = Long.parseLong(location.substring(location.lastIndexOf('/') + 1));

        // 정원이 찬 시간대는 숨겨지고 추가 예약이 거절되어야 한다.
        mockMvc.perform(get(timesUrl).param("date", date.toString()).param("partySize", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(org.hamcrest.Matchers.not(hasItem("18:00"))));
        mockMvc.perform(post("/api/reservations")
                        .header(AUTHORIZATION, bearerToken(anotherCustomer))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"storeId":%d,"reservationTime":"%sT18:00:00","partySize":1}
                                """.formatted(store.getId(), date)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("RESERVATION_SLOT_FULL"));
        // 내 예약 목록은 본인 것만 보여 주고, 다른 고객은 상세를 열 수 없어야 한다.
        mockMvc.perform(get("/api/reservations/me").header(AUTHORIZATION, bearerToken(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(reservationId));
        mockMvc.perform(get("/api/reservations/me").header(AUTHORIZATION, bearerToken(anotherCustomer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
        mockMvc.perform(get("/api/reservations/{id}", reservationId)
                        .header(AUTHORIZATION, bearerToken(anotherCustomer)))
                .andExpect(status().isForbidden());

        // 본인이 예약을 취소하면 상태가 바뀌고 해당 시간대가 다시 예약 가능해야 한다.
        mockMvc.perform(put("/api/reservations/{id}/cancel", reservationId)
                        .header(AUTHORIZATION, bearerToken(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELED"));
        mockMvc.perform(get(timesUrl).param("date", date.toString()).param("partySize", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(hasItem("18:00")));
    }

    // 점주만 예약을 확정·거절할 수 있고 처리된 예약은 다시 처리할 수 없어야 한다.
    @Test
    void ownerCanConfirmOrRejectPendingReservations() throws Exception {
        User owner = userRepository.save(User.createOwner("decision-owner@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("decision-customer@test.com", "encoded-password", "Customer", null));
        Store store = storeRepository.save(Store.create(owner, "Store", "Seoul", null, null));
        LocalDate date = LocalDate.now().plusDays(2);
        Reservation toConfirm = reservationRepository.save(Reservation.create(store, customer, date.atTime(18, 0), 2, null));
        Reservation toReject = reservationRepository.save(Reservation.create(store, customer, date.atTime(18, 30), 2, null));

        mockMvc.perform(put("/api/reservations/{id}/confirm", toConfirm.getId())
                        .header(AUTHORIZATION, bearerToken(customer)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/reservations/{id}/confirm", toConfirm.getId())
                        .header(AUTHORIZATION, bearerToken(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
        mockMvc.perform(put("/api/reservations/{id}/reject", toConfirm.getId())
                        .header(AUTHORIZATION, bearerToken(owner)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("RESERVATION_STATUS_CHANGE_NOT_ALLOWED"));
        mockMvc.perform(put("/api/reservations/{id}/reject", toReject.getId())
                        .header(AUTHORIZATION, bearerToken(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"));
    }

    private String bearerToken(User user) {
        return "Bearer " + authTokenService.createAccessToken(user.getId(), user.getRole());
    }
}
