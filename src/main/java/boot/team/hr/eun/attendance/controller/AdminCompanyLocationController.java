package boot.team.hr.eun.attendance.controller;

import boot.team.hr.eun.attendance.dto.CompanyLocationRequestDto;
import boot.team.hr.eun.attendance.dto.CompanyLocationResponseDto;
import boot.team.hr.eun.attendance.service.CompanyLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/company-location")
public class AdminCompanyLocationController {

    private final CompanyLocationService service;

    @GetMapping
    public List<CompanyLocationResponseDto> list() {
        return service.list();
    }

    @PostMapping
    public CompanyLocationResponseDto create(@RequestBody CompanyLocationRequestDto req) {
        return service.create(req);
    }

    @PutMapping("/{locationId}")
    public CompanyLocationResponseDto update(
            @PathVariable Long locationId,
            @RequestBody CompanyLocationRequestDto req
    ) {
        return service.update(locationId, req);
    }

    @DeleteMapping("/{locationId}")
    public void delete(@PathVariable Long locationId) {
        service.delete(locationId);
    }
}
