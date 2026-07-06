package com.matgourmand.businesshour.service;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.businesshour.domain.BusinessHour;
import com.matgourmand.businesshour.dto.BusinessHourResponse;
import com.matgourmand.businesshour.dto.BusinessHourUpsertRequest;
import com.matgourmand.businesshour.repository.BusinessHourRepository;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ForbiddenException;
import com.matgourmand.common.exception.ResourceNotFoundException;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.user.domain.UserRole;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BusinessHourService {

    private final BusinessHourRepository businessHourRepository;
    private final StoreRepository storeRepository;

    public List<BusinessHourResponse> getBusinessHours(Long storeId) {
        getStoreEntity(storeId);
        return businessHourRepository.findAllByStoreId(storeId).stream()
                .sorted(Comparator.comparingInt(hour -> hour.getDayOfWeek().getValue()))
                .map(BusinessHourResponse::from)
                .toList();
    }

    @Transactional
    public BusinessHourResponse upsertBusinessHour(
            AuthenticatedUser authenticatedUser,
            Long storeId,
            DayOfWeek dayOfWeek,
            BusinessHourUpsertRequest request
    ) {
        Store store = getStoreEntity(storeId);
        validateStoreOwner(authenticatedUser, store);

        BusinessHour businessHour = businessHourRepository.findByStoreIdAndDayOfWeek(storeId, dayOfWeek)
                .map(existing -> {
                    existing.updateSchedule(request.openTime(), request.closeTime(), request.closed());
                    return existing;
                })
                .orElseGet(() -> businessHourRepository.save(
                        BusinessHour.create(store, dayOfWeek, request.openTime(), request.closeTime(), request.closed())
                ));

        return BusinessHourResponse.from(businessHour);
    }

    private Store getStoreEntity(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.STORE_NOT_FOUND,
                        ErrorCode.STORE_NOT_FOUND.getMessage() + " id=" + storeId
                ));
    }

    private void validateStoreOwner(AuthenticatedUser authenticatedUser, Store store) {
        if (authenticatedUser.role() != UserRole.OWNER) {
            throw new ForbiddenException(ErrorCode.OWNER_ROLE_REQUIRED);
        }
        if (!store.getOwner().getId().equals(authenticatedUser.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }
    }
}
