import { Equals } from 'class-validator';

export class CompleteOnboardingDto {
  @Equals(true)
  consentPrivacy: boolean;

  @Equals(true)
  consentAi: boolean;
}
