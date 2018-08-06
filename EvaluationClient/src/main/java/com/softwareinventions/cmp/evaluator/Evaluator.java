package com.softwareinventions.cmp.evaluator;

import com.softwareinventions.cmp.dto.ResponseWrapper;
import com.softwareinventions.cmp.dto.Submit;

public interface Evaluator {
	public ResponseWrapper[] evaluateSubmissions(Submit[] submissions);
}
