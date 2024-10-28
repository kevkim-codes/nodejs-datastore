/*!
 * Copyright 2024 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {google} from '../protos/protos';

const VECTOR_VALUE = 31;

interface VectorDict {
  array_value: {values: {double_value: number}[]};
  meaning: number;
  exclude_from_indexes: boolean;
}

/*A class to represent a Vector for use in query.findNearest.
 *Underlying object will be converted to a map representation in Firestore API.
 */
export class Vector {
  value: number[];

  constructor(value: number[]) {
    this.value = value.map(v => parseFloat(v.toString()));
  }

  get(index: number): number {
    return this.value[index];
  }

  slice(start?: number, end?: number): Vector {
    return new Vector(this.value.slice(start, end));
  }

  get length(): number {
    return this.value.length;
  }

  equals(other: Vector): boolean {
    if (!(other instanceof Vector)) {
      throw new Error('Cannot compare Vector to a non-Vector object.');
    }
    return (
      this.value.length === other.value.length &&
      this.value.every((v, i) => v === other.value[i])
    );
  }

  toString(): string {
    return `Vector<${this.value.join(', ')}>`;
  }

  _toDict(): VectorDict {
    return {
      array_value: {
        values: this.value.map(v => ({double_value: v})),
      },
      meaning: VECTOR_VALUE,
      exclude_from_indexes: true,
    };
  }
}

/**
 * Specifies the behavior of the a Vector Search Query generated by a call to {@link Query.findNearest}.
 */
export interface VectorQueryOptions {
  /**
   * A string specifying the vector field to search on.
   */
  vectorField: string;

  /**
   * The value used to measure the distance from `vectorField` values in the documents.
   */
  queryVector: Vector | Array<number>;

  /**
   * Specifies the upper bound of documents to return, must be a positive integer with a maximum value of 1000.
   */
  limit: number;

  /**
   * Specifies what type of distance is calculated when performing the query.
   */
  distanceMeasure: google.datastore.v1.FindNearest.DistanceMeasure;

  /**
   * Optionally specifies the name of a field that will be set on each returned DocumentSnapshot,
   * which will contain the computed distance for the document.
   */
  distanceResultField?: string;

  /**
   * Specifies a threshold for which no less similar documents will be returned. The behavior
   * of the specified `distanceMeasure` will affect the meaning of the distance threshold.
   *
   *  - For `distanceMeasure: "EUCLIDEAN"`, the meaning of `distanceThreshold` is:
   *     SELECT docs WHERE euclidean_distance <= distanceThreshold
   *  - For `distanceMeasure: "COSINE"`, the meaning of `distanceThreshold` is:
   *     SELECT docs WHERE cosine_distance <= distanceThreshold
   *  - For `distanceMeasure: "DOT_PRODUCT"`, the meaning of `distanceThreshold` is:
   *     SELECT docs WHERE dot_product_distance >= distanceThreshold
   */
  distanceThreshold?: number;
}