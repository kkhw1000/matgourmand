package com.matgourmand.businesshour.domain;

import com.matgourmand.common.entity.BaseTimeEntity;
import com.matgourmand.common.exception.BadRequestException;
import com.matgourmand.common.exception.ErrorCode;
import com.matgourmand.store.domain.Store;
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
import jakarta.persistence.UniqueConstraint;
import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.Getter;

@Entity
@Table(
        name = "business_hours",
        uniqueConstraints = @UniqueConstraint(columnNames = {"store_id", "day_of_week"})
)
@Getter
public class BusinessHour extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    private LocalTime openTime;

    private LocalTime closeTime;

    @Column(name = "is_closed", nullable = false)
    private boolean closed;

    protected BusinessHour() {
    }

    private BusinessHour(Store store, DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime, boolean closed) {
        this.store = store;
        this.dayOfWeek = dayOfWeek;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.closed = closed;
    }

    public static BusinessHour create(Store store, DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime, boolean closed) {
        validate(dayOfWeek, openTime, closeTime, closed);
        return new BusinessHour(store, dayOfWeek, normalizeOpenTime(openTime, closed), normalizeCloseTime(closeTime, closed), closed);
    }

    public void updateSchedule(LocalTime openTime, LocalTime closeTime, boolean closed) {
        validate(dayOfWeek, openTime, closeTime, closed);
        this.openTime = normalizeOpenTime(openTime, closed);
        this.closeTime = normalizeCloseTime(closeTime, closed);
        this.closed = closed;
    }

    private static void validate(DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime, boolean closed) {
        if (dayOfWeek == null) {
            throw new BadRequestException(ErrorCode.BUSINESS_HOUR_DAY_REQUIRED);
        }
        if (closed) {
            return;
        }
        if (openTime == null || closeTime == null) {
            throw new BadRequestException(ErrorCode.BUSINESS_HOUR_TIME_REQUIRED);
        }
        if (!openTime.isBefore(closeTime)) {
            throw new BadRequestException(ErrorCode.BUSINESS_HOUR_TIME_RANGE_INVALID);
        }
    }

    private static LocalTime normalizeOpenTime(LocalTime openTime, boolean closed) {
        return closed ? null : openTime;
    }

    private static LocalTime normalizeCloseTime(LocalTime closeTime, boolean closed) {
        return closed ? null : closeTime;
    }
}
