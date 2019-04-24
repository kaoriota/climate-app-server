import { createParamDecorator } from "routing-controllers";
import { Container } from "typedi";

export function RequestScopeContainer() {
  return createParamDecorator({
    required: true,
    value: action => {
      return Container.of(action.context.state.requestId);
    }
  });
}