package com.matgourmand.store.domain;

import com.matgourmand.common.entity.BaseTimeEntity;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "stores")
public class Store extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoreStatus status;

    protected Store() {
    }

    private Store(User owner, String name, String address, String phone, String description, StoreStatus status) {
        this.owner = owner;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.description = description;
        this.status = status;
    }

    public static Store create(User owner, String name, String address, String phone, String description) {
        if (owner == null) {
            throw new BadRequestException(ErrorCode.STORE_OWNER_REQUIRED);
        }
        if (isBlank(name) || isBlank(address)) {
            throw new BadRequestException(ErrorCode.STORE_NAME_ADDRESS_REQUIRED);
        }
        return new Store(owner, name, address, phone, description, StoreStatus.OPEN);
    }

    public void updateStoreInfo(String name, String address, String phone, String description) {
        if (isBlank(name) || isBlank(address)) {
            throw new BadRequestException(ErrorCode.STORE_NAME_ADDRESS_REQUIRED);
        }
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.description = description;
    }

    public void changeStoreStatus(StoreStatus status) {
        if (status == null) {
            throw new BadRequestException(ErrorCode.STORE_STATUS_REQUIRED);
        }
        this.status = status;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public Long getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getDescription() {
        return description;
    }

    public StoreStatus getStatus() {
        return status;
    }
}
