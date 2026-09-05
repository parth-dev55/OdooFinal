package com.urbanfurniture.accounting.accounting.controller;

import com.urbanfurniture.accounting.accounting.dto.CreateJournalRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalResponse;
import com.urbanfurniture.accounting.accounting.dto.UpdateJournalRequest;
import com.urbanfurniture.accounting.accounting.service.JournalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/journals")
public class JournalController {

    private final JournalService journalService;

    @PostMapping
    public ResponseEntity<JournalResponse> create(@Valid @RequestBody CreateJournalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalService.create(request));
    }

    @GetMapping
    public List<JournalResponse> findAll() {
        return journalService.findAll();
    }

    @GetMapping("/{id}")
    public JournalResponse findById(@PathVariable @Positive Long id) {
        return journalService.findById(id);
    }

    @PutMapping("/{id}")
    public JournalResponse update(@PathVariable @Positive Long id,
                                  @Valid @RequestBody UpdateJournalRequest request) {
        return journalService.update(id, request);
    }

    @PatchMapping("/{id}/archive")
    public JournalResponse archive(@PathVariable @Positive Long id) {
        return journalService.archive(id);
    }
}
