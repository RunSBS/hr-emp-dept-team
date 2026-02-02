package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.CompanyLocationRequestDto;
import boot.team.hr.eun.attendance.dto.CompanyLocationResponseDto;

import java.util.List;

public interface CompanyLocationService {
    List<CompanyLocationResponseDto> list();
    CompanyLocationResponseDto create(CompanyLocationRequestDto req);
    CompanyLocationResponseDto update(Long locationId, CompanyLocationRequestDto req);
    void delete(Long locationId);
}
