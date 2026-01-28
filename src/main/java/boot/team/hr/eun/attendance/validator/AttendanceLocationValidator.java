package boot.team.hr.eun.attendance.vaildator;

import boot.team.hr.eun.attendance.entity.CompanyLocation;
import boot.team.hr.eun.attendance.repo.CompanyLocationRepository;
import boot.team.hr.eun.attendance.util.GeoDistanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@RequiredArgsConstructor
public class AttendanceLocationValidator {

    private final CompanyLocationRepository locationRepository;
    private static final Logger logger = LoggerFactory.getLogger(AttendanceLocationValidator.class);

    public void validate(double latitude, double longitude) {

        CompanyLocation company = locationRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("회사 위치 정보 없음"));

        logger.info("[CHECK-IN] request lat={}, lon={}", latitude, longitude);
        logger.info("[CHECK-IN] company lat={}, lon={}",
                company.getLatitude(), company.getLongitude());

        double distance = GeoDistanceUtil.calculateDistance(
                latitude,
                longitude,
                company.getLatitude(),
                company.getLongitude()
        );

        logger.info("[CHECK-IN] distance(m)={}", distance);
        logger.info("[CHECK-IN] allowed(m)={}", company.getAllowedRadiusM());

        if (distance > company.getAllowedRadiusM()) {
            throw new IllegalStateException("회사 위치 범위 밖입니다.");
        }
    }
}
