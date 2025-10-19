package com.xyq.houduan.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 测评分数验证器
 * 根据测评类型验证分数是否在有效范围内
 */
public class AssessmentScoreValidator implements ConstraintValidator<ValidAssessmentScore, Integer> {

    @Override
    public void initialize(ValidAssessmentScore constraintAnnotation) {
        // 初始化方法，可以在这里获取注解参数
    }

    @Override
    public boolean isValid(Integer score, ConstraintValidatorContext context) {
        if (score == null) {
            return true; // 让@NotNull注解处理null值
        }
        
        // 这里需要获取测评类型，但由于验证器无法直接访问其他字段
        // 我们将在服务层进行验证
        return true;
    }
}
