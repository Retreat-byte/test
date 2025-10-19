package com.xyq.houduan.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * 测评分数验证注解
 * 根据测评类型验证分数是否在有效范围内
 */
@Documented
@Constraint(validatedBy = AssessmentScoreValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAssessmentScore {
    String message() default "测评分数不在有效范围内";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
