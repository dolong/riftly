import Enums from "enums";
import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { object, array, string, number } from "yup";
import { withQuestUpsert } from "shared/HOC/quest";
import QuestFormTemplate from "./QuestFormTemplate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TwitterSpaceCodeForm = ({
    quest = null,
    rewardTypes,
    closeModal,
    isCreate = false,
    isLoading,
    mutationError,
    onUpsert,
}) => {
    const initialValues = {
        type: Enums.TWITTER_SPACE_CODE,
        extendedQuestData: quest?.extendedQuestData ?? {
            twitterEvent: "",
            endDate: "",
            secretCode: "",
            collaboration: "",
        },
        text: quest?.text || "Twitter Code Quest For SPACES Event",
        description: quest?.description ?? "Allow the user to enter a code and claim $SHELL",
        completedText: quest?.completedText || "Completed",
        rewardTypeId: quest?.rewardTypeId || 1,
        quantity: quest?.quantity || 0,
        isEnabled: quest?.isEnabled ?? true,
        isRequired: quest?.isRequired ?? false,
        id: quest?.id || 0,
    };
    const TwitterSpaceCodeSchema = object().shape({
        extendedQuestData: object().shape({
            twitterEvent: string().required("An unique event space is needed!"),
            // endDate: string().required("An end date is required!"),
            secretCode: string().required("A secret code is required!"),
        }),
        text: string().required("Quest text is required"),
        completedText: string().required("Complete Text is required"),
        quantity: number().required().min(0), //optional
    });

    const onSubmit = async (fields, { setStatus }) => {
        try {
            //alert("SUCCESS!! :-)\n\n" + JSON.stringify(fields, null, 4));

            let res = await onUpsert(fields);

            if (res?.data?.isError) {
                setStatus(res.data.message);
            } else {
                closeModal();
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={TwitterSpaceCodeSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={onSubmit}
        >
            {({ values, errors, status, touched, handleChange, setFieldValue }) => {
                return (
                    <Form>
                        <h4 className="card-title mb-3">{isCreate ? "Create" : "Edit"} Quest</h4>
                        <small>Create a Twitter Code Quest</small>
                        <div className="row">
                            {/* Twitter Code Event */}
                            <div className="col-xxl-6 col-xl-6 col-lg-6 mb-3">
                                <label className="form-label">Unique Twitter Event</label>
                                <Field
                                    name={`extendedQuestData.twitterEvent`}
                                    type="text"
                                    className={
                                        "form-control" +
                                        (errors.extendedQuestData &&
                                        errors.extendedQuestData?.twitterEvent &&
                                        touched.extendedQuestData?.twitterEvent
                                            ? " is-invalid"
                                            : "")
                                    }
                                />
                                <ErrorMessage
                                    name={`extendedQuestData.twitterEvent`}
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>

                            <div className="col-xxl-6 col-xl-6 col-lg-6 mb-3">
                                <label className="form-label">End Date</label>
                                {/* <Field
                                    name={`extendedQuestData.endDate`}
                                    type="text"
                                    className={
                                        "form-control" +
                                        (errors.extendedQuestData &&
                                        errors.extendedQuestData?.endDate &&
                                        touched.extendedQuestData?.endDate
                                            ? " is-invalid"
                                            : "")
                                    }
                                /> */}
                                <Field name={`extendedQuestData.endDate`}>
                                    {({ field, meta, form: { setFieldValue } }) => {
                                        // console.log(field);

                                        return (
                                            <DatePicker
                                                className={
                                                    "form-control" +
                                                    (errors.extendedQuestData &&
                                                    errors.extendedQuestData?.endDate &&
                                                    touched.extendedQuestData?.endDate
                                                        ? " is-invalid"
                                                        : "")
                                                }
                                                {...field}
                                                utcOffset={0}
                                                dateFormat="yyyy-MM-dd"
                                                selected={
                                                    (field.value && new Date(field.value)) || null
                                                }
                                                onChange={(val) => {
                                                    // console.log(val);
                                                    // let reference = val;
                                                    // let adjusteddateValue = new Date(
                                                    //     reference.getTime() -
                                                    //         reference.getTimezoneOffset() * 24000
                                                    // ).toISOString();

                                                    setFieldValue(`extendedQuestData.endDate`, val);
                                                }}
                                            />
                                        );
                                    }}
                                </Field>
                                {/* <ErrorMessage
                                    name={`extendedQuestData.endDate`}
                                    component="div"
                                    className="invalid-feedback"
                                /> */}
                            </div>
                            <div className="col-xxl-6 col-xl-6 col-lg-6 mb-3">
                                <label className="form-label">Secret Code</label>
                                <Field
                                    name={`extendedQuestData.secretCode`}
                                    type="text"
                                    className={
                                        "form-control" +
                                        (errors.extendedQuestData &&
                                        errors.extendedQuestData?.secretCode &&
                                        touched.extendedQuestData?.secretCode
                                            ? " is-invalid"
                                            : "")
                                    }
                                />
                                <ErrorMessage
                                    name={`extendedQuestData.secretCode`}
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>
                            <div className="col-xxl-6 col-xl-6 col-lg-6 mb-3">
                                <label className="form-label">
                                    Collaboration (leaving blank for non specific collaboration)
                                </label>
                                <Field
                                    name={`extendedQuestData.collaboration`}
                                    type="text"
                                    className={
                                        "form-control" +
                                        (errors.extendedQuestData &&
                                        errors.extendedQuestData?.collaboration &&
                                        touched.extendedQuestData?.collaboration
                                            ? " is-invalid"
                                            : "")
                                    }
                                />
                                <ErrorMessage
                                    name={`extendedQuestData.collaboration`}
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>

                            <QuestFormTemplate
                                values={values}
                                errors={errors}
                                touched={touched}
                                onTextChange={(t) => setFieldValue("text", t)}
                                onCompletedTextChange={(c) => setFieldValue("completedText", c)}
                                onDescriptionChange={(d) => setFieldValue("description", d)}
                                onRewardTypeChange={(rt) => setFieldValue("rewardTypeId", rt)}
                                onRewardQuantityChange={(rq) => setFieldValue("quantity", rq)}
                                onIsEnabledChange={handleChange}
                                rewardTypes={rewardTypes}
                            />
                            <div
                                className={`col-12 mb-3 text-red-500 ${
                                    status ? "d-block" : "d-none"
                                }`}
                            >
                                <label className="form-label">API error: {status}</label>
                            </div>

                            <div className="col-12 mb-3">
                                <button
                                    type="submit"
                                    className="btn btn-success mr-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={closeModal}
                                    disabled={isLoading}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default withQuestUpsert(TwitterSpaceCodeForm);
