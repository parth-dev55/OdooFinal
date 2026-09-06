package com.urbanfurniture.accounting.budget.service;

import com.urbanfurniture.accounting.budget.dto.AnalyticAccountResponse;
import com.urbanfurniture.accounting.budget.dto.CreateAnalyticAccountRequest;
import com.urbanfurniture.accounting.budget.dto.UpdateAnalyticAccountRequest;
import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import com.urbanfurniture.accounting.budget.repository.AnalyticAccountRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticAccountService {

    private final AnalyticAccountRepository analyticAccountRepository;

    @Transactional
    public AnalyticAccountResponse create(CreateAnalyticAccountRequest request) {
        String name = request.name().trim();
        ensureNameAvailable(name);
        AnalyticAccount account = new AnalyticAccount();
        account.setName(name);
        account.setType(request.type());
        account.setActive(request.active() == null || request.active());
        return AnalyticAccountResponse.from(analyticAccountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<AnalyticAccountResponse> findAll() {
        return analyticAccountRepository.findAll().stream().map(AnalyticAccountResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AnalyticAccountResponse findById(Long id) {
        return AnalyticAccountResponse.from(findAccount(id));
    }

    @Transactional
    public AnalyticAccountResponse update(Long id, UpdateAnalyticAccountRequest request) {
        AnalyticAccount account = findAccount(id);
        if (request.name() != null) {
            String name = request.name().trim();
            if (!name.equalsIgnoreCase(account.getName())) {
                ensureNameAvailable(name);
            }
            account.setName(name);
        }
        if (request.type() != null) account.setType(request.type());
        if (request.active() != null) account.setActive(request.active());
        return AnalyticAccountResponse.from(analyticAccountRepository.save(account));
    }

    @Transactional
    public AnalyticAccountResponse deactivate(Long id) {
        AnalyticAccount account = findAccount(id);
        account.setActive(false);
        return AnalyticAccountResponse.from(analyticAccountRepository.save(account));
    }

    private AnalyticAccount findAccount(Long id) {
        return analyticAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Analytic account " + id + " was not found"));
    }

    private void ensureNameAvailable(String name) {
        if (analyticAccountRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Analytic account '" + name + "' already exists");
        }
    }
}
