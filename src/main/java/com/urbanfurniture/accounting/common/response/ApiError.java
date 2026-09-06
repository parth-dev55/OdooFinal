package com.urbanfurniture.accounting.common.response;

import java.util.List;

public record ApiError(String message, List<String> details) {
}
