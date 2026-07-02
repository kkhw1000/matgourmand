package com.matgourmand.store.service;

import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.common.exception.ResourceNotFoundException;
import com.matgourmand.store.domain.Store;
import com.matgourmand.store.dto.StoreCreateRequest;
import com.matgourmand.store.dto.StoreResponse;
import com.matgourmand.store.dto.StoreStatusUpdateRequest;
import com.matgourmand.store.dto.StoreUpdateRequest;
import com.matgourmand.store.repository.StoreRepository;
import com.matgourmand.user.domain.User;
import com.matgourmand.user.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreService(StoreRepository storeRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public StoreResponse createStore(StoreCreateRequest request) {
        User owner = userRepository.findById(request.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.OWNER_NOT_FOUND,
                        ErrorCode.OWNER_NOT_FOUND.getMessage() + " id=" + request.ownerId()
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
    public StoreResponse updateStore(Long storeId, StoreUpdateRequest request) {
        Store store = getStoreEntity(storeId);
        store.updateStoreInfo(request.name(), request.address(), request.phone(), request.description());
        return StoreResponse.from(store);
    }

    @Transactional
    public StoreResponse changeStoreStatus(Long storeId, StoreStatusUpdateRequest request) {
        Store store = getStoreEntity(storeId);
        store.changeStoreStatus(request.status());
        return StoreResponse.from(store);
    }

    @Transactional
    public void deleteStore(Long storeId) {
        Store store = getStoreEntity(storeId);
        storeRepository.delete(store);
    }

    private Store getStoreEntity(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.STORE_NOT_FOUND,
                        ErrorCode.STORE_NOT_FOUND.getMessage() + " id=" + storeId
                ));
    }
}
