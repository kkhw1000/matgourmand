package com.matgourmand.businesshour.repository;

import com.matgourmand.businesshour.domain.BusinessHour;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessHourRepository extends JpaRepository<BusinessHour, Long> {

    Optional<BusinessHour> findByStoreIdAndDayOfWeek(Long storeId, DayOfWeek dayOfWeek);

    List<BusinessHour> findAllByStoreId(Long storeId);
}
