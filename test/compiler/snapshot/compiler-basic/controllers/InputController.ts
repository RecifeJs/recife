import { Query } from '../../../../../src';
import { FilterUser } from './UserInput';
import InputModel from '../models/InputModel';

class InputController {
  @Query()
  getUser(input: FilterUser): InputModel {
    return new InputModel();
  }
}

export default InputController;
