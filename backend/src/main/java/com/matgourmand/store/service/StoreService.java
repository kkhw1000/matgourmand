package com.matgourmand.store.service;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ForbiddenException;
import com.matgourmand.common.exception.ResourceNotFoundException;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.dto.StoreCreateRequest;
import com.matgourmand.store.dto.StoreResponse;
import com.matgourmand.store.dto.StoreStatusUpdateRequest;
import com.matgourmand.store.dto.StoreUpdateRequest;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.domain.UserRole;
import com.matgourmand.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    @Transactional
    public StoreResponse createStore(AuthenticatedUser authenticatedUser, StoreCreateRequest request) {
        validateOwnerRole(authenticatedUser);

        User owner = userRepository.findById(authenticatedUser.id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.OWNER_NOT_FOUND,
                        ErrorCode.OWNER_NOT_FOUND.getMessage() + " id=" + authenticatedUser.id()
                ));

        Store store = Store.create(owner, request.name(), request.address(), request.phone(), request.description());
        return StoreResponse.from(storeRepository.save(store));
    }

    public StoreResponse getStore(Long storeId) {
        return StoreResponse.from(getStoreEntity(storeId));
    }

    public List<StoreResponse> getStores() {
        return storeRepository.findAll().stream()
                .map(StoreResponse::from)
                .toList();
    }

    @Transactional
    public StoreResponse updateStore(
            AuthenticatedUser authenticatedUser,
            Long storeId,
            StoreUpdateRequest request
    ) {
        Store store = getStoreEntity(storeId);
        validateStoreOwner(authenticatedUser, store);
        store.updateStoreInfo(request.name(), request.address(), request.phone(), request.description());
        return StoreResponse.from(store);
    }

    @Transactional
    public StoreResponse changeStoreStatus(
            AuthenticatedUser authenticatedUser,
            Long storeId,
            StoreStatusUpdateRequest request
    ) {
        Store store = getStoreEntity(storeId);
        validateStoreOwner(authenticatedUser, store);
        store.changeStoreStatus(request.status());
        return StoreResponse.from(store);
    }

    @Transactional
    public void deleteStore(AuthenticatedUser authenticatedUser, Long storeId) {
        Store store = getStoreEntity(storeId);
        validateStoreOwner(authenticatedUser, store);
        storeRepository.delete(store);
    }

    private Store getStoreEntity(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.STORE_NOT_FOUND,
                        ErrorCode.STORE_NOT_FOUND.getMessage() + " id=" + storeId
                ));
    }

    private void validateOwnerRole(AuthenticatedUser authenticatedUser) {
        if (authenticatedUser.role() != UserRole.OWNER) {
            throw new ForbiddenException(ErrorCode.OWNER_ROLE_REQUIRED);
        }
    }

    private void validateStoreOwner(AuthenticatedUser authenticatedUser, Store store) {
        validateOwnerRole(authenticatedUser);
        if (!store.getOwner().getId().equals(authenticatedUser.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }
    }
}
