package com.matgourmand.common.config;

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
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DevDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final BusinessHourRepository businessHourRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordHasher passwordHasher;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("owner@matgourmand.dev").isPresent()) {
            return;
        }

        User owner = userRepository.save(User.createOwner(
                "owner@matgourmand.dev",
                passwordHasher.hash("owner1234!"),
                "MatGourmand Owner",
                "010-1234-5678"
        ));
        User customer = userRepository.save(User.createCustomer(
                "customer@matgourmand.dev",
                passwordHasher.hash("customer1234!"),
                "MatGourmand Customer",
                "010-8765-4321"
        ));

        Store store = storeRepository.save(Store.create(
                owner,
                "MatGourmand Bistro",
                "서울 성수동 123-45",
                "02-123-4567",
                "프렌치 코스와 내추럴 와인을 중심으로 운영하는 예약제 비스트로"
        ));

        for (DayOfWeek dayOfWeek : DayOfWeek.values()) {
            boolean closed = dayOfWeek == DayOfWeek.SUNDAY;
            businessHourRepository.save(BusinessHour.create(
                    store,
                    dayOfWeek,
                    closed ? null : LocalTime.of(12, 0),
                    closed ? null : LocalTime.of(22, 0),
                    closed
            ));
        }

        reservationRepository.save(Reservation.create(
                store,
                customer,
                LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY)).atTime(18, 30),
                2,
                "창가 자리 가능하면 부탁드립니다."
        ));
    }
}
