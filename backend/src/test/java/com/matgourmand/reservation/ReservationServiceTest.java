package com.matgourmand.reservation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.businesshour.domain.BusinessHour;
import com.matgourmand.businesshour.repository.BusinessHourRepository;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ForbiddenException;
import com.matgourmand.reservation.domain.Reservation;
import com.matgourmand.reservation.domain.ReservationStatus;
import com.matgourmand.reservation.dto.ReservationCreateRequest;
import com.matgourmand.reservation.service.ReservationService;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ReservationServiceTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private BusinessHourRepository businessHourRepository;

    @Autowired
    private com.matgourmand.reservation.repository.ReservationRepository reservationRepository;

    @Test
    void customerCanCreateReservationWithinBusinessHours() {
        User owner = userRepository.save(User.createOwner("owner@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("customer@test.com", "encoded-password", "Customer", null));
        Store store = storeRepository.save(Store.create(owner, "Store", "Seoul", null, null));
        businessHourRepository.save(BusinessHour.create(
                store,
                DayOfWeek.MONDAY,
                LocalTime.of(9, 0),
                LocalTime.of(21, 0),
                false
        ));

        LocalDateTime reservationTime = nextDayOfWeekAt(DayOfWeek.MONDAY, 18, 0);
        var response = reservationService.createReservation(
                authenticatedUser(customer),
                new ReservationCreateRequest(store.getId(), reservationTime, 2, "window seat")
        );

        assertThat(response.storeId()).isEqualTo(store.getId());
        assertThat(response.customerId()).isEqualTo(customer.getId());
        assertThat(response.status()).isEqualTo(ReservationStatus.PENDING);
    }

    @Test
    void reservationFailsWhenStoreIsClosedThatDay() {
        User owner = userRepository.save(User.createOwner("owner2@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("customer2@test.com", "encoded-password", "Customer", null));
        Store store = storeRepository.save(Store.create(owner, "Store", "Seoul", null, null));
        businessHourRepository.save(BusinessHour.create(store, DayOfWeek.TUESDAY, null, null, true));

        LocalDateTime reservationTime = nextDayOfWeekAt(DayOfWeek.TUESDAY, 18, 0);

        assertThatThrownBy(() -> reservationService.createReservation(
                authenticatedUser(customer),
                new ReservationCreateRequest(store.getId(), reservationTime, 2, null)
        ))
                .isInstanceOf(BadRequestException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.RESERVATION_TIME_NOT_AVAILABLE);
    }

    @Test
    void reservationFailsWhenTimeIsOutsideBusinessHours() {
        User owner = userRepository.save(User.createOwner("owner3@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("customer3@test.com", "encoded-password", "Customer", null));
        Store store = storeRepository.save(Store.create(owner, "Store", "Seoul", null, null));
        businessHourRepository.save(BusinessHour.create(
                store,
                DayOfWeek.WEDNESDAY,
                LocalTime.of(10, 0),
                LocalTime.of(20, 0),
                false
        ));

        LocalDateTime reservationTime = nextDayOfWeekAt(DayOfWeek.WEDNESDAY, 21, 0);

        assertThatThrownBy(() -> reservationService.createReservation(
                authenticatedUser(customer),
                new ReservationCreateRequest(store.getId(), reservationTime, 2, null)
        ))
                .isInstanceOf(BadRequestException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.RESERVATION_TIME_NOT_AVAILABLE);
    }

    @Test
    void anotherCustomerCannotCancelReservation() {
        User owner = userRepository.save(User.createOwner("owner4@test.com", "encoded-password", "Owner", null));
        User customer = userRepository.save(User.createCustomer("customer4@test.com", "encoded-password", "Customer", null));
        User anotherCustomer = userRepository.save(User.createCustomer("customer5@test.com", "encoded-password", "Customer2", null));
        Store store = storeRepository.save(Store.create(owner, "Store", "Seoul", null, null));
        Reservation reservation = reservationRepository.save(Reservation.create(
                store,
                customer,
                nextDayOfWeekAt(DayOfWeek.THURSDAY, 18, 0),
                2,
                null
        ));

        assertThatThrownBy(() -> reservationService.cancelReservation(
                authenticatedUser(anotherCustomer),
                reservation.getId()
        ))
                .isInstanceOf(ForbiddenException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN);
    }

    private AuthenticatedUser authenticatedUser(User user) {
        return new AuthenticatedUser(user.getId(), user.getRole());
    }

    private LocalDateTime nextDayOfWeekAt(DayOfWeek dayOfWeek, int hour, int minute) {
        return LocalDate.now()
                .with(TemporalAdjusters.nextOrSame(dayOfWeek))
                .atTime(hour, minute);
    }
}
