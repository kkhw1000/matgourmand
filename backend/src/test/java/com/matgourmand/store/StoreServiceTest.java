package com.matgourmand.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.businesshour.dto.BusinessHourUpsertRequest;
import com.matgourmand.businesshour.service.BusinessHourService;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ForbiddenException;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.dto.StoreCreateRequest;
import com.matgourmand.store.dto.StoreUpdateRequest;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.store.service.StoreService;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.domain.UserRole;
import com.matgourmand.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class StoreServiceTest {

    @Autowired
    private StoreService storeService;

    @Autowired
    private BusinessHourService businessHourService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Test
    void ownerCanCreateStore() {
        User owner = userRepository.save(User.createOwner("owner@test.com", "encoded-password", "Owner", null));

        var response = storeService.createStore(
                authenticatedUser(owner),
                new StoreCreateRequest("MatGourmand", "Seoul", "02-111-2222", "French dining")
        );

        assertThat(response.ownerId()).isEqualTo(owner.getId());
        assertThat(response.name()).isEqualTo("MatGourmand");
        assertThat(storeRepository.findById(response.id())).isPresent();
    }

    @Test
    void customerCannotCreateStore() {
        User customer = userRepository.save(User.createCustomer("customer@test.com", "encoded-password", "Customer", null));

        assertThatThrownBy(() -> storeService.createStore(
                authenticatedUser(customer),
                new StoreCreateRequest("MatGourmand", "Seoul", null, null)
        ))
                .isInstanceOf(ForbiddenException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.OWNER_ROLE_REQUIRED);
    }

    @Test
    void anotherOwnerCannotUpdateStore() {
        User owner = userRepository.save(User.createOwner("owner1@test.com", "encoded-password", "Owner1", null));
        User anotherOwner = userRepository.save(User.createOwner("owner2@test.com", "encoded-password", "Owner2", null));
        Store store = storeRepository.save(Store.create(owner, "Original", "Seoul", null, null));

        assertThatThrownBy(() -> storeService.updateStore(
                authenticatedUser(anotherOwner),
                store.getId(),
                new StoreUpdateRequest("Updated", "Busan", null, null)
        ))
                .isInstanceOf(ForbiddenException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN);
    }

    @Test
    void onlyStoreOwnerCanUpsertBusinessHour() {
        User owner = userRepository.save(User.createOwner("owner3@test.com", "encoded-password", "Owner3", null));
        User anotherOwner = userRepository.save(User.createOwner("owner4@test.com", "encoded-password", "Owner4", null));
        Store store = storeRepository.save(Store.create(owner, "Store", "Seoul", null, null));

        assertThatThrownBy(() -> businessHourService.upsertBusinessHour(
                authenticatedUser(anotherOwner),
                store.getId(),
                DayOfWeek.MONDAY,
                new BusinessHourUpsertRequest(LocalTime.of(9, 0), LocalTime.of(21, 0), false)
        ))
                .isInstanceOf(ForbiddenException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN);
    }

    private AuthenticatedUser authenticatedUser(User user) {
        return new AuthenticatedUser(user.getId(), user.getRole());
    }
}
