export interface PriceModel {
  /** Advance one time step and return the new mid price. */
  next(): number;
}
