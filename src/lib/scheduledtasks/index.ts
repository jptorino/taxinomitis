// local dependencies
import * as cf from '../utils/cf';
import * as conversation from '../training/conversation';
import * as visualrec from '../training/visualrecognition';
import * as credentials from '../training/credentials';
import * as pendingjobs from '../pendingjobs/runner';
import * as constants from '../utils/constants';
import loggerSetup from '../utils/logger';

const log = loggerSetup();




export function run(): void {

    // start scheduled cleanup tasks
    if (cf.isPrimaryInstance()) {


        log.info('Scheduling clean-up task to run every hour');
        // delete any classifiers which have expired, to free up
        //  the available credentials for other students
        setInterval(async () => {
            await conversation.cleanupExpiredClassifiers();
            await visualrec.cleanupExpiredClassifiers();
        }, constants.ONE_HOUR);



        log.info('Scheduling image store cleanup to run every three hours');
        // delete any images from the S3 object storage, where
        //  they are no longer required for ML projects
        setInterval(() => {
            pendingjobs.run();
        }, constants.THREE_HOURS);
        // run immediately so we don't have to wait for three hours
        //  for this to be done (this task is more critical than the
        //  others)
        pendingjobs.run();



        log.info('Scheduling check of Bluemix credentials to run every day');
        // check that the Bluemix credentials stored in
        //   the tool are still valid
        setInterval(() => {
            credentials.checkBluemixCredentials();
        }, constants.ONE_DAY_PLUS_A_BIT);

    }
}
