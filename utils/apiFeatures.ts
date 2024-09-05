// The error you're encountering in TypeScript occurs because TypeScript cannot infer the type of queryObj, especially when indexing it with a string.
// You can solve this by explicitly telling TypeScript that queryObj is an object with keys of type string.
interface QueryStr {
  [key: string]: any;
}

class APIfeatures {
  query: any;
  queryString: QueryStr;
  constructor(query: any, queryString: QueryStr) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filters documents numerically (greater than, less than)
  filter() {
    // Get the req.query object
    const queryObj: QueryStr = { ...this.queryString };

    //Identify elements that are not going o be filtered in the query object
    const excludedFields = ["page", "sort", "limit", "fields"];

    //Delete the unwanted fields
    excludedFields.forEach((el) => delete queryObj[el]);

    /// The element that will be used is converted to a string
    let queryStr = JSON.stringify(queryObj);

    //Configuring the string to be understood by mongodb - from {"age": {"gte": 25}} to {"age": {"gte": 25}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //string is converted to an object
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sorts documents in Ascending and Descending order
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.page * 1 || 3;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIfeatures;
