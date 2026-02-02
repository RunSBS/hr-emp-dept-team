package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.CompanyLocationRequestDto;
import boot.team.hr.eun.attendance.dto.CompanyLocationResponseDto;
import boot.team.hr.eun.attendance.entity.CompanyLocation;
import boot.team.hr.eun.attendance.repo.CompanyLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyLocationServiceImpl implements CompanyLocationService {

    private final CompanyLocationRepository companyLocationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyLocationResponseDto> list() {
        return companyLocationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CompanyLocationResponseDto create(CompanyLocationRequestDto req) {

        CompanyLocation entity = new CompanyLocation(); // ✅ builder 안 씀

        entity.setCompanyName(req.getCompanyName());
        entity.setLatitude(toDouble(req.getLatitude()));
        entity.setLongitude(toDouble(req.getLongitude()));

        // 엔티티는 int, DTO는 Integer라 null 방어
        entity.setAllowedRadiusM(req.getAllowedRadiusM() == null ? 0 : req.getAllowedRadiusM());

        entity.setAddress(req.getAddress());
        entity.setActiveYn(req.getActiveYn() == null ? "Y" : req.getActiveYn());

        CompanyLocation saved = companyLocationRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public CompanyLocationResponseDto update(Long locationId, CompanyLocationRequestDto req) {

        CompanyLocation entity = companyLocationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 locationId의 회사 위치가 없습니다."));

        // null이면 기존값 유지하고 싶으면 이런 방식
        if (req.getCompanyName() != null) entity.setCompanyName(req.getCompanyName());
        if (req.getLatitude() != null) entity.setLatitude(toDouble(req.getLatitude()));
        if (req.getLongitude() != null) entity.setLongitude(toDouble(req.getLongitude()));
        if (req.getAllowedRadiusM() != null) entity.setAllowedRadiusM(req.getAllowedRadiusM());
        if (req.getAddress() != null) entity.setAddress(req.getAddress());
        if (req.getActiveYn() != null) entity.setActiveYn(req.getActiveYn());

        // @PreUpdate가 updatedAt 처리해줌
        return toResponse(entity);
    }

    @Override
    public void delete(Long locationId) {
        if (!companyLocationRepository.existsById(locationId)) {
            throw new IllegalArgumentException("해당 locationId의 회사 위치가 없습니다.");
        }
        companyLocationRepository.deleteById(locationId);
    }

    /* =========================
       Entity -> ResponseDto
    ========================= */
    private CompanyLocationResponseDto toResponse(CompanyLocation e) {
        return CompanyLocationResponseDto.builder()
                .locationId(e.getLocationId())
                .companyName(e.getCompanyName())
                .latitude(toBigDecimal(e.getLatitude()))
                .longitude(toBigDecimal(e.getLongitude()))
                .allowedRadiusM(e.getAllowedRadiusM())
                .address(e.getAddress())
                .activeYn(e.getActiveYn())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    /* =========================
       Converters
    ========================= */
    private static double toDouble(BigDecimal v) {
        return v == null ? 0.0 : v.doubleValue();
    }

    private static BigDecimal toBigDecimal(double v) {
        // DB NUMBER(10,7) 맞춰 scale 7로 정리
        return BigDecimal.valueOf(v).setScale(7, RoundingMode.HALF_UP);
    }
}
